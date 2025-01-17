<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Models\MyTask;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Auth;

class MyTaskController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        $search = $request->input("search");
        $limit = $request->input("limit");
        $page = $request->input("page");
        $orderBy = $request->input("orderBy");
        $order = $request->input("order");
        $toSkip = ($page - 1) * $limit;
        $myTasks = Auth::user()->myTasks()
            ->name($search)
            ->customer($search)
            ->description($search)
            ->priority($search)
            ->status($search)
            ->assigneenames($search)
            ->order($orderBy, $order)
            ->skipPage($toSkip)
            ->take($limit)
            ->get();
        $myTasks = $myTasks->unique("id")->all();
        return response()->json(['count' => Auth::user()->myTasks()->count(), 'total' => Auth::user()->myTasks()->count(), 'data' => $myTasks]);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        //
    }

    /**
     * Display the specified resource.
     *
     * @param  \App\Models\MyTask  $myTask
     * @return \Illuminate\Http\Response
     */
    public function show(MyTask $myTask)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Models\MyTask  $myTask
     * @return \Illuminate\Http\Response
     */
    public function edit(MyTask $myTask)
    {
        $asigneeIds = [];
        $initialAssignees = [];
        foreach ($myTask->users()->select("user_id", "name")->get()->toArray() as $userInfo) {
            array_push($asigneeIds, $userInfo["user_id"]);
            array_push($initialAssignees, $userInfo["name"]);
        }
        $myTask["asigneeIds"] = $asigneeIds;
        $myTask["initialAssignees"] = $initialAssignees;
        $myTask["customer"] = $myTask->customer;
        return response()->json(['status' => 200, 'myTask' => $myTask]);
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Models\MyTask  $myTask
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, MyTask $myTask)
    {
        $validator = Validator::make($request->all(), [
            "name" => "required|max:200",
            "description" => "required|max:200",
            "duedate" => "required|max:200",
            "repeat" => "required|max:200",
            "priority" => "required|max:200",
            "status" => "required|max:200",
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $assigneeNames = [];
        $assigneeNameArrays = User::select('name')->whereIn('id', $request["asigneeIds"])->get()->toArray();
        foreach ($assigneeNameArrays as $assigneeNameArray) {
            array_push($assigneeNames, $assigneeNameArray["name"]);
        }
        $request["assigneeNames"] = implode(", ", $assigneeNames);
        $myTask->users()->sync($request["asigneeIds"]);
        $myTask->update($request->all());
        return response()->json(['status' => 200, 'myTask' => $myTask]);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Models\MyTask  $myTask
     * @return \Illuminate\Http\Response
     */
    public function destroy(MyTask $myTask)
    {
        //
    }

    public function updateStatus(Request $request, MyTask $myTask)
    {
        $validator = Validator::make($request->all(), [
            "status" => "required|max:200",
        ]);
        if ($validator->fails()) {
            return response()->json(['status' => 422, 'errors' => $validator->messages()]);
        }
        $myTask->update($request->all());
        return response()->json(['status' => 200, 'myTask' => $myTask]);
    }
}
